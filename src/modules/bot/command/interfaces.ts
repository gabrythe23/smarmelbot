export interface OpenTriviaResponse {
  response_code?: number;
  results?: OpenTriviaResponseResult[];
}

export interface OpenTriviaResponseResult {
  category?: string;
  type?: string;
  difficulty?: string;
  question?: string;
  correct_answer?: string;
  incorrect_answers?: string[];
}
