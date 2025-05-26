package controllers

import (
	"DataScience-quiz/Dto"
	"DataScience-quiz/models"
	_ "DataScience-quiz/models"
	"gorm.io/gorm"
	"net/http"

	"DataScience-quiz/config"
	"github.com/gin-gonic/gin"
)

type UserAnswerInput struct {
	QuestionID uint `json:"question_id" example:"1"`
	AnswerID   uint `json:"answer_id" example:"3"`
}

// @Summary      Get questions
// @Description  Returns all quiz questions
// @Tags         questions
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}  Dto.Question
// @Router       /quiz/questions [get]
func GetQuestions(c *gin.Context) {
	var questions []models.Question

	// Получаем вопросы вместе с вариантами ответов
	if err := config.DB.Preload("Answers").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить вопросы"})
		return
	}

	c.JSON(http.StatusOK, questions)
}

// @Summary      Answer
// @Description  Answer the question
// @Tags         answers
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        input body []UserAnswerInput true "Answers list"
// @Success      200  {array}  map[string]int
// @Router       /quiz/submit [post]
func SubmitAnswers(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input []struct {
		QuestionID uint `json:"question_id"`
		AnswerID   uint `json:"answer_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var correctCount int

	for _, ans := range input {
		var answer models.Answer
		if err := config.DB.First(&answer, ans.AnswerID).Error; err != nil {
			continue
		}

		userAnswer := models.UserAnswer{
			UserID:     userID,
			QuestionID: ans.QuestionID,
			AnswerID:   ans.AnswerID,
			Correct:    answer.IsCorrect,
		}
		config.DB.Create(&userAnswer)

		if answer.IsCorrect {
			correctCount++
		}
	}

	// Обновляем счет пользователя
	config.DB.Model(&models.User{}).Where("id = ?", userID).
		Update("score", gorm.Expr("score + ?", correctCount))

	c.JSON(http.StatusOK, gin.H{"correct_answers": correctCount})
}

// @Summary      Get leaderboard
// @Description  Returns leaderboard
// @Tags         leaderboard
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}  []Dto.UserRank
// @Router       /quiz/leaderboard [get]
func GetLeaderboard(c *gin.Context) {
	var users []models.User

	if err := config.DB.Order("score desc").Limit(10).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить рейтинг"})
		return
	}

	var leaderboard []Dto.UserRank
	for _, u := range users {
		leaderboard = append(leaderboard, Dto.UserRank{Email: u.Email, Score: u.Score})
	}

	c.JSON(http.StatusOK, leaderboard)
}
