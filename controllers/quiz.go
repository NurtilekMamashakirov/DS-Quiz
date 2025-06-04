package controllers

import (
	"DataScience-quiz/Dto"
	"DataScience-quiz/models"
	_ "DataScience-quiz/models"
	"gorm.io/gorm"
	"math/rand"
	"net/http"
	"time"

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

// @Summary      Create a new question
// @Description  Creates a new question with answers (admin only)
// @Tags         questions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        input body Dto.CreateQuestionRequest true "Question data"
// @Success      201  {object}  Dto.Question
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Router       /quiz/questions [post]
func CreateQuestion(c *gin.Context) {
	var input Dto.CreateQuestionRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, что сложность имеет допустимое значение
	if input.Difficulty != 300 && input.Difficulty != 400 && input.Difficulty != 500 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Сложность должна быть 300, 400 или 500"})
		return
	}

	// Проверяем наличие хотя бы одного правильного ответа
	hasCorrectAnswer := false
	for _, a := range input.Answers {
		if a.IsCorrect {
			hasCorrectAnswer = true
			break
		}
	}

	if !hasCorrectAnswer {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Должен быть хотя бы один правильный ответ"})
		return
	}

	// Создаем новый вопрос
	question := models.Question{
		Text:       input.Text,
		Difficulty: input.Difficulty,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&question).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать вопрос"})
		return
	}

	// Создаем варианты ответов
	for _, a := range input.Answers {
		answer := models.Answer{
			QuestionID: question.ID,
			Text:       a.Text,
			IsCorrect:  a.IsCorrect,
		}
		if err := tx.Create(&answer).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать варианты ответов"})
			return
		}
	}

	tx.Commit()

	// Загружаем созданный вопрос со всеми ответами
	config.DB.Preload("Answers").First(&question, question.ID)
	c.JSON(http.StatusCreated, question)
}

// @Summary      Get random question set
// @Description  Returns a random set of 9 questions (3 of each difficulty level)
// @Tags         questions
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}  Dto.Question
// @Router       /quiz/random [get]
func GetRandomQuestionSet(c *gin.Context) {
	var allQuestions []models.Question

	// Получаем все вопросы с их ответами
	if err := config.DB.Preload("Answers").Find(&allQuestions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить вопросы"})
		return
	}

	// Разделяем вопросы по сложности
	easy := filterQuestionsByDifficulty(allQuestions, 300)
	medium := filterQuestionsByDifficulty(allQuestions, 400)
	hard := filterQuestionsByDifficulty(allQuestions, 500)

	// Формируем случайную выборку
	randomSet := make([]models.Question, 0, 9)

	// Добавляем вопросы каждой сложности
	randomSet = append(randomSet, getRandomQuestions(easy, 3)...)
	randomSet = append(randomSet, getRandomQuestions(medium, 3)...)
	randomSet = append(randomSet, getRandomQuestions(hard, 3)...)

	c.JSON(http.StatusOK, randomSet)
}

// filterQuestionsByDifficulty фильтрует вопросы по уровню сложности
func filterQuestionsByDifficulty(questions []models.Question, difficulty int) []models.Question {
	filtered := make([]models.Question, 0)
	for _, q := range questions {
		if q.Difficulty == difficulty {
			filtered = append(filtered, q)
		}
	}
	return filtered
}

// getRandomQuestions возвращает случайную выборку n вопросов из списка
func getRandomQuestions(questions []models.Question, n int) []models.Question {
	if len(questions) <= n {
		return questions
	}

	// Создаем копию слайса, чтобы не изменять оригинал
	shuffled := make([]models.Question, len(questions))
	copy(shuffled, questions)

	// Инициализируем генератор случайных чисел
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Перемешиваем вопросы
	r.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	return shuffled[:n]
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

	var totalScore int

	for _, ans := range input {
		var answer models.Answer
		if err := config.DB.First(&answer, ans.AnswerID).Error; err != nil {
			continue
		}

		var question models.Question
		if err := config.DB.First(&question, ans.QuestionID).Error; err != nil {
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
			totalScore += question.Difficulty
		}
	}

	// Обновляем счет пользователя
	config.DB.Model(&models.User{}).Where("id = ?", userID).
		Update("score", gorm.Expr("score + ?", totalScore))

	c.JSON(http.StatusOK, gin.H{"earned_points": totalScore})
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
