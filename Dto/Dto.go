package Dto

type User struct {
	Email    string
	Password string
	Score    int
}

type Question struct {
	Text    string
	Answers []Answer
}

type Answer struct {
	QuestionID uint
	Text       string
	IsCorrect  bool
}

type UserAnswer struct {
	UserID     uint
	QuestionID uint
	AnswerID   uint
	Correct    bool
}

type UserRank struct {
	Email string `json:"email"`
	Score int    `json:"score"`
}
