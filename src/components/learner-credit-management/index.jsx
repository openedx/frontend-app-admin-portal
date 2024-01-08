import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MultipleBudgetsPage from './MultipleBudgetsPage';
import BudgetDetailPage from './BudgetDetailPage';

const LearnerCreditManagementRoutes = () => (
  <main className="learner-credit-management">
    <Routes>
      <Route
        path="/"
        element={<MultipleBudgetsPage />}
      />

      <Route
        path="/:budgetId/:activeTabKey?"
        element={<BudgetDetailPage />}
      />
    </Routes>
  </main>
);

export default LearnerCreditManagementRoutes;
