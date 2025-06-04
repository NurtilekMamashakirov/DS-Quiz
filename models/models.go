package models

import "gorm.io/gorm"

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Password string
	Score    int
	Role     Role `gorm:"type:varchar(10);default:'user'"`
}

type Question struct {
	gorm.Model
	Text       string
	Answers    []Answer
	Difficulty int `gorm:"default:300"` // 300, 400 или 500 баллов
}

type Answer struct {
	gorm.Model
	QuestionID uint
	Text       string
	IsCorrect  bool
}

type UserAnswer struct {
	gorm.Model
	UserID     uint
	QuestionID uint
	AnswerID   uint
	Correct    bool
}
