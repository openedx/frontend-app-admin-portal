import PropTypes from 'prop-types';
import { Card, Form } from '@edx/paragon';
import ThemeSvg from './ThemeSvg';

export default function ThemeCard({ themeVars, selected, setTheme }) {
  return (
    <Card style={{ width: '18rem' }} isClickable>
      <Card.Section className="p-0">
        <ThemeSvg themeVars={themeVars} />
      </Card.Section>
      <Card.Footer className="justify-content-between pt-2.5">
        <h3>{themeVars.title}</h3>
        <Form.Radio
          checked={selected.title === themeVars.title}
          onChange={() => setTheme()}
          data-testid={`radio-${themeVars.title}`}
          name="theme"
          defaultChecked={themeVars.title === 'Scholar (Default)'}
          value={themeVars.title}
        />
      </Card.Footer>
    </Card>
  );
}

ThemeCard.propTypes = {
  themeVars: PropTypes.shape({
    title: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.shape({
    title: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
  }).isRequired,
  setTheme: PropTypes.func.isRequired,
};
