import React from 'react';
import { Exercise } from '../types';

interface ProblemCardProps {
  exercise: Exercise;
}

// Helper component to render complex example values in a readable format
const ExampleValueRenderer: React.FC<{ value: unknown }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-[#8b949e]">null</span>;
  }

  if (typeof value === 'string') {
    return <span className="text-[#e6edf3]">"{value}"</span>;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="text-[#e6edf3]">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[#e6edf3]">[]</span>;
    }
    
    const isSimpleArray = value.every(item => 
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null
    );
    
    if (isSimpleArray) {
      return (
        <span className="text-[#e6edf3]">
          {'['}
          {value.map((item, i) => (
            <React.Fragment key={i}>
              {typeof item === 'string' ? <span>"{item}"</span> : String(item)}
              {i < value.length - 1 && <span>, </span>}
            </React.Fragment>
          ))}
          {']'}
        </span>
      );
    }
    
    // Complex array - render each item on a new line
    return (
      <div className="text-[#e6edf3]">
        {'['}
        {value.map((item, i) => (
          <div key={i} className="ml-3">
            <ExampleValueRenderer value={item} />
            {i < value.length - 1 && <span>,</span>}
          </div>
        ))}
        {'] '}
      </div>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return <span className="text-[#e6edf3]">{}</span>;
    }
    
    // Render object properties in a structured way
    return (
      <div className="text-[#e6edf3]">
        {'{' }
        {keys.map((key, i) => (
          <div key={i} className="ml-3">
            <span className="text-[#79c0ff]">{key}:</span>
            {' '}
            <ExampleValueRenderer value={(value as Record<string, unknown>)[key]} />
            {i < keys.length - 1 && <span>,</span>}
          </div>
        ))}
        {' }'}
      </div>
    );
  }

  return <span className="text-[#e6edf3]">{String(value)}</span>;
};

export const ProblemCard: React.FC<ProblemCardProps> = ({ exercise }) => {
  return (
    <div className="col-body-content">
      <div className="problem-title text-[16px] font-bold mb-3 leading-[1.3]">{exercise.title}</div>
      
      <div className="prose text-[13px] leading-[1.7] text-[#c9d1d9] mb-4">
        <p className="leading-relaxed whitespace-pre-wrap">{exercise.description}</p>
      </div>
      
      {exercise.constraints.length > 0 && (
        <div className="section-label text-[10px] font-bold tracking-[1px] uppercase text-[#8b949e] mt-3.5 mb-1.5">
          Constraints
        </div>
      )}
      
      {exercise.constraints.length > 0 && (
        <div className="constraints flex flex-col gap-1.5 mb-4">
          {exercise.constraints.map((constraint, idx) => (
            <div key={idx} className="constraint flex items-center gap-2 font-mono text-[11.5px] text-[#c9d1d9]">
              <span className="text-[#58a6ff] text-[16px] leading-1 flex-shrink-0">•</span>
              {constraint}
            </div>
          ))}
        </div>
      )}
      
      {exercise.examples.length > 0 && (
        <div className="section-label text-[10px] font-bold tracking-[1px] uppercase text-[#8b949e] mb-2">
          Examples
        </div>
      )}
      
      {exercise.examples.length > 0 && (
        <div className="space-y-2 mb-4">
          {exercise.examples.slice(0, 2).map((example, idx) => {
            // Parse JSON strings for better rendering
            const parseValue = (val: unknown): unknown => {
              if (typeof val === 'string') {
                try {
                  return JSON.parse(val);
                } catch {
                  // If not valid JSON, return as-is (handles "array" style strings)
                  return val;
                }
              }
              return val;
            };
            
            return (
              <div key={idx} className="example-card bg-[#1c2333] border border-[#30363d] rounded-[8px] px-3 py-2.5 mb-2">
                <div className="example-label text-[11px] text-[#8b949e] mb-1.5">Example {idx + 1}</div>
                <div className="example-io text-[12px] whitespace-pre-wrap">
                  <div className="mb-1.5">
                    <span className="k text-[#8b949e]">Input:</span>
                    <ExampleValueRenderer value={parseValue(example.input)} />
                  </div>
                  <div>
                    <span className="k text-[#8b949e]">Output:</span>
                    <span className="example-out text-[#3fb950] font-semibold">
                      <ExampleValueRenderer value={parseValue(example.output)} />
                    </span>
                  </div>
                </div>
                {/* Explanation if available */}
                {example.explanation && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#30363d]">
                    <div className="text-[10px] font-bold tracking-[0.8px] uppercase text-[#8b949e] mb-1">
                      Explanation
                    </div>
                    <p className="text-[12px] leading-[1.6] text-[#c9d1d9] whitespace-pre-wrap">
                      {example.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {(exercise.teaching_points && exercise.teaching_points.length > 0) && (
        <div className="section-label text-[10px] font-bold tracking-[1px] uppercase text-[#8b949e] mt-4 mb-2">
          <span className="text-[#a371f7]">★</span> Key Teaching Points
        </div>
      )}
      
      {(exercise.teaching_points && exercise.teaching_points.length > 0) && (
        <div className="teaching-list flex flex-col gap-2 mb-4">
          {exercise.teaching_points.map((point, idx) => (
            <div key={idx} className="teaching-item flex gap-2 items-start text-[12.5px] leading-[1.5] text-[#c9d1d9]">
              <span className="star text-[#a371f7] flex-shrink-0 mt-0.5">★</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}
      
      {(exercise.teaching_notes && exercise.teaching_notes.length > 0) && (
        <div className="section-label text-[10px] font-bold tracking-[1px] uppercase text-[#8b949e] mb-2">
          <span className="text-[#a371f7]">💡</span> Additional Notes
        </div>
      )}
      
      {(exercise.teaching_notes && exercise.teaching_notes.length > 0) && (
        <div className="notes flex flex-col gap-2">
          {exercise.teaching_notes.map((note, idx) => (
            <div key={idx} className="note text-[12px] leading-[1.6] text-[#8b949e] py-2 border-t border-[#30363d]">
              {note}
            </div>
          ))}
        </div>
      )}
      
      {exercise.guidance_intro && (
        <div className="guidance-note bg-[rgba(88,166,255,0.08)] border border-[rgba(88,166,255,0.25)] rounded-[8px] px-3 py-2.5 mt-2">
          <div className="text-[10px] text-[#58a6ff] uppercase tracking-wider mb-1">Guidance</div>
          <p className="text-[12.5px] leading-[1.6] text-[#c9d1d9]">{exercise.guidance_intro}</p>
        </div>
      )}
    </div>
  );
};
