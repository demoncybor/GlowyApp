import { fireEvent, render, screen } from '@testing-library/react-native';

import { CompatibilityBadge } from '@/components/compatibility-badge';

it('muestra el porcentaje y despliega la explicación al tocar', async () => {
  const reasons = ['Es apto para piel grasa.', 'Está dentro de tu presupuesto.'];
  await render(<CompatibilityBadge score={85} reasons={reasons} />);

  expect(screen.getByText('85%')).toBeTruthy();
  expect(screen.queryByText(`• ${reasons[0]}`)).toBeNull();

  await fireEvent.press(screen.getByText('85%'));
  expect(screen.getByText(`• ${reasons[0]}`)).toBeTruthy();
  expect(screen.getByText(`• ${reasons[1]}`)).toBeTruthy();
});
