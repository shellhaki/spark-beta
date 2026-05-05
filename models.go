package main

import "time"

type BetaSignupRequest struct {
	FullName   string `json:"full_name"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Profession string `json:"profession"`
}

type BetaTester struct {
	ID         string    `json:"id"`
	FullName   string    `json:"full_name"`
	Email      string    `json:"email"`
	Profession string    `json:"profession"`
	CreatedAt  time.Time `json:"created_at"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

type SignupResponse struct {
	Message string     `json:"message"`
	Tester  BetaTester `json:"tester"`
	Slots   Slots      `json:"slots"`
}

type HealthResponse struct {
	Status string `json:"status"`
}

type Slots struct {
	Total     int `json:"total"`
	Taken     int `json:"taken"`
	Remaining int `json:"remaining"`
}

type CandidatesResponse struct {
	Count      int          `json:"count"`
	Candidates []BetaTester `json:"candidates"`
}
