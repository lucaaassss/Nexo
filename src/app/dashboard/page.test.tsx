import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './page';

describe('DashboardPage', () => {
  it('permite crear una tarea nueva desde el formulario', async () => {
    const user = userEvent.setup();
    render(React.createElement(DashboardPage));

    const input = screen.getByPlaceholderText(/agregar nueva tarea/i);
    await user.type(input, 'Preparar demo final');
    await user.click(screen.getByRole('button', { name: /crear tarea/i }));

    expect(screen.getByText('Preparar demo final')).toBeInTheDocument();
  });
});
