package controllers

import (
	"DataScience-quiz/models"
	"net/http"

	"DataScience-quiz/config"
	"DataScience-quiz/middleware"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Email    string `json:"email" binding:"required" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"password123"`
	Role     string `json:"role" example:"user"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"password123"`
}

// @Summary      Register
// @Description  register user
// @Tags         register
// @Accept       json
// @Produce      json
// @Param        input  body      RegisterInput  true  "Account Info"
// @Success      200    {object}  map[string]string
// @Failure      400    {object}  map[string]string
// @Router       /register [post]
func Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)

	role := models.RoleUser
	if input.Role == string(models.RoleAdmin) {
		role = models.RoleAdmin
	}

	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь уже существует"})
		return
	}

	token, _ := middleware.GenerateToken(user.ID, string(user.Role))
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// @Summary      Login
// @Description  login user
// @Tags         login
// @Accept       json
// @Produce      json
// @Param        input  body      LoginInput  true  "Login Info"
// @Success      200    {object}  map[string]string
// @Failure      400    {object}  map[string]string
// @Failure      401    {object}  map[string]string
// @Router       /login [post]
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный пароль"})
		return
	}

	token, _ := middleware.GenerateToken(user.ID, string(user.Role))
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"email": user.Email,
			"role":  user.Role,
			"score": user.Score,
		},
	})
}
