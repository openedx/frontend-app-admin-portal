import * as React from 'react';
import { BeatLoader } from 'react-spinners';

import { edxProvider } from '../../auth/providers/edx';
import { AuthService } from '../../auth/service';

export class CompleteLogin extends React.Component {
    render() {
        return <BeatLoader color="#36D7B7" size={25} />;
    }

    componentDidMount() {
        AuthService.extractSession(edxProvider);
        window.location.href = AuthService.extractRedirectPath(edxProvider);
    }
}
