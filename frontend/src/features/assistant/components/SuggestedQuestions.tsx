type SuggestedQuestionsProps = {
  questions: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
};

export function SuggestedQuestions({ questions, onPick, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="assistant-suggestions">
      <span className="assistant-suggestions-title">Prueba con:</span>
      {questions.map((question) => (
        <button key={question} type="button" onClick={() => onPick(question)} disabled={disabled}>
          {question}
        </button>
      ))}
    </div>
  );
}
