import Link from 'next/link';
import UpdateItem from '../components/CreatItem';
const Update = ({query}) => (
    <div>
        <UpdateItem id={ query.id }/>
    </div>
)
export default Update;