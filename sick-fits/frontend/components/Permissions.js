import { Query } from 'react-apollo';
import Error from './ErrorMessage';
import gql from 'graphql-tag';
import Table from './styles/Table';
import PropTypes from 'prop-types';
import SickButton from './styles/SickButton';

const possiblePermissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE',
  ];

const ALL_USERS_QUERY = gql`
    query {
        users {
            id
            name
            email
            permissions
        }
    }
`;
const Permissions = props => (
    <Query query={ ALL_USERS_QUERY }>
        {({data, loading, error}) => {
          console.log(data);
            return (
               <div>
                <Error error={error} />
                <div>
                  <h2>Manage Permissions</h2>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                        <th>👇🏻</th>
                      </tr>
                    </thead>
                    <tbody>{data.users.map(user => <UserPermissions user={user} key={user.id} />)}</tbody>
                  </Table>
                </div>
              </div>
            ) 
         }}
    </Query>
);

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name:PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired
  }
  state = {
    permissions: this.props.user.permissions
  }
    render() {
      const user = this.props.user;
      return (
        <tr>
          <td>{user.name}</td>
          <td>{user.email}</td>
          {possiblePermissions.map(permission => (
            <td key={permission}>
              <label htmlFor={`${user.id}-permission-${permission}`}>
                <input
                type="checkbox"
                checked={this.state.permission.includes(permission)}
                value={permission}
                onChange={this.handlePermissionChange}
                 />
              </label>
            </td>
          ))}
          <td>
            <SickButton>Update</SickButton>
          </td>
        </tr>
      );
    }
  }

export default Permissions;
