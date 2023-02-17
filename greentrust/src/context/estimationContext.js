import * as React from "react";
import { useState } from "react";

const EstimationContext = React.createContext(undefined);

function EstimationProvider({ children }) {
  const [estimation, setEstimation] = useState();
  const [error, setError] = useState();
  const [isEstimating, setIsEstimating] = useState(false);

  return (
    <EstimationContext.Provider
      value={{
        estimation,
        setEstimation,
        error,
        setError,
        isEstimating,
        setIsEstimating,
      }}
    >
      {children}
    </EstimationContext.Provider>
  );
}

function useEstimationContext() {
  const context = React.useContext(EstimationContext);
  if (context === undefined) {
    throw new Error("useEstimation must be used within a EstimationProvider");
  }
  return context;
}

export { EstimationProvider, useEstimationContext };
