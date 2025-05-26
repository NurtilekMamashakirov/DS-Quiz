package config

import (
	"DataScience-quiz/models"
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Question{},
		&models.Answer{},
		&models.UserAnswer{},
	)
	if err != nil {
		log.Fatal("Ошибка миграции:", err)
	}

	DB = db
	fmt.Println("База данных успешно подключена")
	return db
}
