import type { ElectionResults } from '../model/types';

type ResultsChartProps = {
  results: ElectionResults;
};

export function ResultsChart({ results }: ResultsChartProps) {
  return (
    <div className="results">
      <div className="results-head">
        <span>Total de votos</span>
        <strong>{results.totalVotes}</strong>
      </div>

      {results.options.map((option) => (
        <div className="result-row" key={option.optionId}>
          <div className="result-head">
            <span>{option.title}</span>
            <span>
              {option.voteCount} {option.voteCount === 1 ? 'voto' : 'votos'} · {option.percentage}%
            </span>
          </div>
          <div className="result-bar" role="presentation">
            <span style={{ width: `${Math.min(option.percentage, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
