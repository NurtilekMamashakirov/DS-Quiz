package routes

import (
	"DataScience-quiz/controllers"
	"DataScience-quiz/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	// Добавляем глобальный CORS middleware
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		quiz := api.Group("/quiz")
		quiz.Use(middleware.AuthMiddleware())
		{
			quiz.GET("/questions", controllers.GetQuestions)
			quiz.GET("/random", controllers.GetRandomQuestionSet)
			quiz.POST("/submit", controllers.SubmitAnswers)
			quiz.GET("/leaderboard", controllers.GetLeaderboard)

			admin := quiz.Group("")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.POST("/questions", controllers.CreateQuestion)
			}
		}
	}
}
