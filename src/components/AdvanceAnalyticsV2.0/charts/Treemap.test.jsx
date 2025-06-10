import { shallow } from 'enzyme';
import Plot from 'react-plotly.js';
import Treemap from './Treemap';

describe('Treemap Component', () => {
  const labels = ['awesome', 'JavaScript', 'React', 'CSS'];
  const values = ['', 100, 80, 60];
  const parents = ['', 'awesome', 'awesome', 'awesome'];

  it('should render plotly treemap with correct props', () => {
    const wrapper = shallow(<Treemap labels={labels} values={values} parents={parents} />);
    const plotComponent = wrapper.find(Plot);

    // Verify data prop
    expect(plotComponent.prop('data')).toEqual([
      {
        type: 'treemap',
        labels: ['awesome', 'JavaScript', 'React', 'CSS'],
        parents: ['', 'awesome', 'awesome', 'awesome'],
        values: ['', 100, 80, 60],
        tiling: {
          pad: 0.2,
        },
        root: { color: 'white' },
        textinfo: 'label+value',
      },
    ]);

    // Verify layout prop
    expect(plotComponent.prop('layout')).toEqual({
      margin: {
        t: 0, l: 0, r: 0, b: 0,
      },
    });

    // Verify config prop
    expect(plotComponent.prop('config')).toEqual({
      displayModeBar: false,
    });

    // Verify style prop
    expect(plotComponent.prop('style')).toEqual({ width: '100%', height: '100%' });
  });
});
