import PropTypes from 'prop-types';
import { Button, Card, Form } from '@edx/paragon';
import ThemeSvg from './ThemeSvg';
import { SCHOLAR_THEME } from '../data/constants';

export default function ThemeCard({
  themeVars, theme, setTheme, openCustom,
}) {
  const isCustom = themeVars.title === 'Custom Theme';
  function selectTheme(vars) {
    setTheme([vars, theme[1]]);
  }

  function deleteCustom() {
    if (theme[0].title === 'Custom Theme') {
      setTheme([SCHOLAR_THEME, null]);
    } else {
      setTheme([theme[0], null]);
    }
  }

  return (
    <Card style={{ width: '18rem' }} isClickable>
      <Card.Section className="p-0">
        <ThemeSvg themeVars={themeVars} />
      </Card.Section>
      <Card.Footer className="justify-content-between pt-2.5 pb-0">
        <h3>{themeVars.title}</h3>
        <Form.Radio
          checked={theme[0].title === themeVars.title}
          onChange={() => selectTheme(themeVars)}
          data-testid={`radio-${themeVars.title}`}
          name="theme"
          value={themeVars.title}
        />
      </Card.Footer>
      {isCustom && (
      <div className="ml-auto">
        <Button className="" variant="tertiary" onClick={() => deleteCustom()}>Delete</Button>
        <Button className="" variant="tertiary" onClick={() => openCustom()}>Edit</Button>
      </div>
      )}
      {!isCustom && (<div className="pt-3" />)}
    </Card>
  );
}

ThemeCard.propTypes = {
  themeVars: PropTypes.shape({
    title: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.arrayOf(PropTypes.string.isRequired),
    ]),
  ).isRequired,
  setTheme: PropTypes.func.isRequired,
  openCustom: PropTypes.func.isRequired,
};
