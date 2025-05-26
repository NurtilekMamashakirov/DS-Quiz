package seed

import (
	"DataScience-quiz/config"
	"DataScience-quiz/models"
	"fmt"
)

func Load() {
	questions := []models.Question{
		{
			Text: "Что такое overfitting в машинном обучении?",
			Answers: []models.Answer{
				{Text: "Модель хорошо работает на обучающих данных, но плохо на новых", IsCorrect: true},
				{Text: "Модель идеально обобщает данные", IsCorrect: false},
				{Text: "Это способ сбора данных", IsCorrect: false},
			},
		},
		{
			Text: "Какой алгоритм лучше всего подходит для классификации?",
			Answers: []models.Answer{
				{Text: "K-средних", IsCorrect: false},
				{Text: "Логистическая регрессия", IsCorrect: true},
				{Text: "PCA", IsCorrect: false},
			},
		},
		{
			Text: "Что делает метод PCA?",
			Answers: []models.Answer{
				{Text: "Снижает размерность данных", IsCorrect: true},
				{Text: "Увеличивает размерность", IsCorrect: false},
				{Text: "Повышает точность модели", IsCorrect: false},
			},
		},
	}

	for _, q := range questions {
		err := config.DB.Create(&q).Error
		if err != nil {
			fmt.Println("Ошибка при создании вопроса:", err)
		}
	}
}
