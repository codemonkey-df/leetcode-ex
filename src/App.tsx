import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ExerciseScreen } from './components/ExerciseScreen';
import { ConfigPanel } from './components/ConfigPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SessionProvider, useSession } from './hooks/useSession';
import { ToastProvider } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';

function Content() {
  const { session, resetExercise, nextExercise } = useSession();
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextExercise = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextExercise();
    }, 1000);
  };

  const handleTryAgain = () => {
    resetExercise();
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      {/* Config Panel */}
      <ConfigPanel
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isActive={isLoading} message="Generating exercise..." />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden">
        {session.status === 'IDLE' ? (
          <WelcomeScreen />
        ) : session.currentExercise ? (
          <ExerciseScreen
            exercise={session.currentExercise}
            onNext={handleNextExercise}
            onTryAgain={handleTryAgain}
          />
        ) : (
          <LoadingOverlay isActive={true} message="Loading exercise..." />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Content />
        </ErrorBoundary>
      </ToastProvider>
    </SessionProvider>
  );
}

export default App;
