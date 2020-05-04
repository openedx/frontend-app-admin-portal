import { connect } from 'react-redux';

import TemplateSourceFields from '../../components/TemplateSourceFields';

import { setEmailTemplateSource } from '../../data/actions/emailTemplate';

const mapStateToProps = state => ({
  emailTemplateSource: state.emailTemplate.emailTemplateSource,
});

const mapDispatchToProps = dispatch => ({
  setEmailTemplateSource: templateSource => dispatch(setEmailTemplateSource(templateSource)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSourceFields);
