import * as React from 'react';
import { BeatLoader } from 'react-spinners';

import { edxProvider } from '../../auth/providers/edx';
import { AuthService } from '../../auth/service';

export class StartLogin extends React.Component {
    render() {
        return <BeatLoader color="#36D7B7" size={25} />
    }

    componentDidMount() {
        const redirectParam = window.location.href.match(/redirect=([^&]+)/);
        const redirectPath = redirectParam ? decodeURIComponent(redirectParam[1]) : '/';
        AuthService.authenticate(edxProvider, redirectPath);
    }
}
