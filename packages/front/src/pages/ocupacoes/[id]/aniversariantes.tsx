import { GuardPage } from '../../../security/GuardPage';
import { ROLES } from '../../../enums/ROLES';
import { BirthdaysView } from '../../../components/BirthdaysView';

const OccupationBirthdays = () => {
    return <BirthdaysView />;
};

export default GuardPage(ROLES.CONTENT_EDITOR, OccupationBirthdays);
