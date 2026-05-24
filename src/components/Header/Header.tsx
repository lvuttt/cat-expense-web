/**
 * Header — App title and branding.
 *
 * Single Responsibility: renders the app header — no state, no logic.
 */

import './Header.css';

export function Header() {
  return (
    <header className="header" id="app-header">
      <div className="header__logo" aria-hidden="true">
        🐱
      </div>
      <h1 className="header__title">Cat Expense</h1>
      <p className="header__subtitle">
        Track your feline friend&apos;s expenses with purr-fection
      </p>
    </header>
  );
}
