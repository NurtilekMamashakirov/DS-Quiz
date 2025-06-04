package middleware

import (
	"DataScience-quiz/config"
	"DataScience-quiz/models"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("supersecretkey")

func GenerateToken(userID uint, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	return token.SignedString(jwtSecret)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("user_id", uint(claims["user_id"].(float64)))
			if role, exists := claims["role"]; exists {
				c.Set("role", role)
			}
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		}
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			userID, exists := c.Get("user_id")
			if !exists {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Требуется авторизация"})
				return
			}

			var user models.User
			if err := config.DB.First(&user, userID).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не найден"})
				return
			}

			if user.Role != models.RoleAdmin {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Доступ запрещен. Требуются права администратора"})
				return
			}
		} else if role != string(models.RoleAdmin) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Доступ запрещен. Требуются права администратора"})
			return
		}

		c.Next()
	}
}
