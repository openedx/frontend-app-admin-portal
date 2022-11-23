import PropTypes from 'prop-types';
import {
  ActionRow, Button, Card, Form,
} from '@edx/paragon';
import ThemeSvg from './ThemeSvg';
import { CUSTOM_THEME_LABEL, SCHOLAR_THEME } from '../data/constants';

const ThemeCard = ({
  themeVars, theme, setTheme, openCustom,
}) => {
  const isCustom = themeVars.title === CUSTOM_THEME_LABEL;
  function selectTheme(vars) {
    setTheme([vars, theme[1]]);
  }

  function deleteCustom() {
    if (theme[0].title === CUSTOM_THEME_LABEL) {
      setTheme([SCHOLAR_THEME, null]);
    } else {
      setTheme([theme[0], null]);
    }
  }

  return (
    <Card style={{ width: '18rem' }}>
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
      <ActionRow className="mb-2 mr-2 mt-1">
        <Button className="" variant="tertiary" onClick={() => deleteCustom()}>Delete</Button>
        <Button className="" variant="tertiary" onClick={() => openCustom()}>Edit</Button>
      </ActionRow>
      )}
      {!isCustom && (<div className="pt-3" />)}
    </Card>
  );
};

ThemeCard.defaultProps = {
  openCustom: null,
};

ThemeCard.propTypes = {
  themeVars: PropTypes.shape({
    title: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      button: PropTypes.string.isRequired,
      banner: PropTypes.string.isRequired,
      accent: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setTheme: PropTypes.func.isRequired,
  openCustom: PropTypes.func,
};

export default ThemeCard;
