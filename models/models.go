package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Password string
	Score    int
}

type Question struct {
	gorm.Model
	Text    string
	Answers []Answer
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
