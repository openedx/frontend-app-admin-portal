import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Fieldset, InputText, Button } from '@edx/paragon';

import LoginForm from './index';

describe('<LoginForm />', () => {
  describe('renders correctly', () => {
    let wrapper;
    const LoginFormWrapper = props => (
      <MemoryRouter>
        <LoginForm
          login={() => {}}
          {...props}
        />
      </MemoryRouter>
    );

    it('with inital (non loading) state', () => {
      const tree = renderer
        .create((
          <LoginFormWrapper
            loading={false}
            isAuthenticated={false}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const tree = renderer
        .create((
          <LoginFormWrapper
            loading
            isAuthenticated={false}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          <LoginFormWrapper
            loading={false}
            isAuthenticated={false}
            error={Error('Network Error')}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('handles username/password change', () => {
      wrapper = mount((
        <LoginFormWrapper
          loading={false}
          isAuthenticated={false}
        />
      ));

      const input = wrapper.find(LoginForm).find(Fieldset).find(InputText);

      input.find('input').first().simulate('change', { target: { value: 'test@example.com' } });
      input.find('input').last().simulate('change', { target: { value: 'supersecretpassword' } });

      expect(wrapper.find('LoginForm').instance().state.email).toEqual('test@example.com');
      expect(wrapper.find('LoginForm').instance().state.password).toEqual('supersecretpassword');
    });

    it('submit calls login prop', () => {
      const login = jest.fn();
      wrapper = mount((
        <LoginFormWrapper
          loading={false}
          isAuthenticated={false}
          login={login}
          email="test@example.com"
          password="supersecretpassword"
        />
      ));

      const submit = wrapper.find(LoginForm).find(Fieldset).find(Button);
      submit.find('button').first().simulate('click');
      expect(login).toHaveBeenCalled();
      expect(wrapper.find('LoginForm').instance().state.email).toEqual('');
      expect(wrapper.find('LoginForm').instance().state.password).toEqual('');
    });
  });

  describe('redirects correctly when authenticated', () => {
    let wrapper;

    const RootPathPage = () => (
      <div>
        <p>Welcome to the home page!</p>
      </div>
    );

    const MyPathPage = () => (
      <div>
        <p>You are now at my path</p>
      </div>
    );

    const LoginFormWrapper = props => (
      <MemoryRouter initialEntries={['/start']}>
        <Switch>
          <Redirect push from="/start" {...props} />
          <Route
            exact
            path="/login"
            render={routeProps => <LoginForm {...routeProps} loading={false} isAuthenticated />}
          />
          <Route exact path="/mypath" component={MyPathPage} />
          <Route path="/" component={RootPathPage} />
        </Switch>
      </MemoryRouter>
    );

    it('to referrer if given', () => {
      wrapper = mount((
        <LoginFormWrapper
          to={{
            pathname: '/login',
            state: { from: { pathname: '/mypath' } },
          }}
        />
      ));
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('to root path if no referrer is given', () => {
      wrapper = mount((
        <LoginFormWrapper to="/login" />
      ));
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
