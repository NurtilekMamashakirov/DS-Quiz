package seed

import (
	"DataScience-quiz/config"
	"DataScience-quiz/models"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func Load() {
	createUsers()
}

func createUsers() {
	var adminCount int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount)

	if adminCount == 0 {
		hashedAdminPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 10)
		admin := models.User{
			Email:    "admin@example.com",
			Password: string(hashedAdminPassword),
			Role:     models.RoleAdmin,
		}
		if err := config.DB.Create(&admin).Error; err != nil {
			fmt.Println("Ошибка при создании администратора:", err)
		} else {
			fmt.Println("Администратор создан: admin@example.com / admin123")
		}
	}

	var userCount int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleUser).Count(&userCount)

	if userCount == 0 {
		hashedUserPassword, _ := bcrypt.GenerateFromPassword([]byte("user123"), 10)
		user := models.User{
			Email:    "user@example.com",
			Password: string(hashedUserPassword),
			Role:     models.RoleUser,
		}
		if err := config.DB.Create(&user).Error; err != nil {
			fmt.Println("Ошибка при создании пользователя:", err)
		} else {
			fmt.Println("Пользователь создан: user@example.com / user123")
		}
	}
}
