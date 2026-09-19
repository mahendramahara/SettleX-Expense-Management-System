import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Logo } from '../components/ui/Logo';

describe('UI Atomic Components', () => {
  it('should render Button with text and trigger onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Settle Debt</Button>);

    const button = screen.getByRole('button', { name: /Settle Debt/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should disable Button and display loading state', () => {
    render(
      <Button isLoading disabled>
        Processing
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render Input component with label and error state', () => {
    render(
      <Input
        id="test-input"
        label="Group Name"
        error="Group name is required"
        defaultValue="BCA Final Project"
      />
    );

    expect(screen.getByText('Group Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BCA Final Project')).toBeInTheDocument();
    expect(screen.getByText('Group name is required')).toBeInTheDocument();
  });

  it('should render Badge component with correct text', () => {
    render(<Badge variant="primary">Student Tier</Badge>);

    expect(screen.getByText('Student Tier')).toBeInTheDocument();
  });

  it('should render SettleX Logo brand', () => {
    render(<Logo size="lg" />);

    expect(screen.getByText('Settle')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
