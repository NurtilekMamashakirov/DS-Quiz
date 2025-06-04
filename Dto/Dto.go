package Dto

type User struct {
	Email    string
	Password string
	Score    int
	Role     string `json:"role"`
}

type Question struct {
	Text       string
	Answers    []Answer
	Difficulty int `json:"difficulty"`
}

type CreateQuestionRequest struct {
	Text       string   `json:"text" binding:"required"`
	Difficulty int      `json:"difficulty" binding:"required"`
	Answers    []Answer `json:"answers" binding:"required"`
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
