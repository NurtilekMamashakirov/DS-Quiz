package main

import (
	"DataScience-quiz/config"
	_ "DataScience-quiz/docs" // важно для импорта swag-документации
	"DataScience-quiz/routes"
	"DataScience-quiz/seed" // Добавлено
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Data Science Quiz API
// @version         1.0
// @description     REST API for your quiz project
// @host            localhost:8080
// @BasePath        /api/
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	db := config.InitDB()
	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	seed.Load() // ← Загрузка тестовых данных

	r := gin.Default()
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	routes.RegisterRoutes(r)

	r.Run(":8080")
}
