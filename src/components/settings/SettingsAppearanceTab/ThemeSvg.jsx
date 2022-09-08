import PropTypes from 'prop-types';
import Color from 'color';
import { DARK_COLOR, WHITE_COLOR } from '../data/constants';

export default function ThemeSvg({ themeVars }) {
  const bannerColor = (Color(themeVars.banner).isDark() ? Color(WHITE_COLOR) : Color(DARK_COLOR));
  return (
    <svg viewBox="87.68 236.596 356.789 153.834" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect id="background" x="87.719" y="236.819" width="356.605" height="153.611" style={{ fill: 'rgb(255, 255, 255)' }} />
        <rect id="banner" x="87.909" y="236.596" width="356.398" height="66.539" style={{ fill: themeVars.banner }} />
        <rect id="accent" x="87.68" y="297.186" width="356.789" height="5.987" style={{ fill: themeVars.accent }} />
        <rect id="header" style={{ fillOpacity: '0.5', fill: bannerColor }} x="106.803" y="257.24" width="223.394" height="22.808" rx="10" ry="10" />
        <rect id="body1" style={{ fillOpacity: '0.5', fill: 'rgb(59, 59, 59)' }} x="108" y="316.942" width="173.388" height="11.186" rx="6.1" ry="6.1" />
        <rect id="body2" style={{ fillOpacity: '0.5', fill: 'rgb(59, 59, 59)' }} x="108" y="341.246" width="173.388" height="11.186" rx="6.1" ry="6.1" />
        <rect id="button" x="334.056" y="343.284" width="88.792" height="32.211" style={{ fill: themeVars.button }} />
      </g>
    </svg>
  );
}

ThemeSvg.propTypes = {
  themeVars: PropTypes.shape({
    title: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
  }).isRequired,
};
