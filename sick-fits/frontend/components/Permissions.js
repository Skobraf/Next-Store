import { Query } from 'react-apollo';
import Error from './ErrorMessage';

const Permission = props => (
    <Query query={ ALL_USERS_QUERY }>
        {({data, loading, error}) => (
            <div>
                <Error error={error} />
            </div>
        )}
    </Query>
);

export default Permissions
