import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router'
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: {id: $id}) {
            id
            title
            description
            price
        }
    }
`;
const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $title:String!
        $description:String!
        $price:Int§
    ) {
        UpdateItem(
            title: $title
            description: $description
            price: $price
        ) {
            id
            title
            description
            price
        }
    }

`

class UpdateItem extends Component {
    state={ }
    handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({[name]: val});
    }
    render() {
        return (
            <Query query={SINGLE_ITEM_QUERY} variables={this.props.id}>
                {({data, loading})=> {
                    if(loading) return <p>Loading...</p>
                    return (
                        <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, {loading, error}) => (
                <Form onSubmit={async e => {
                    // stop form form submit
                    e.preventDefault();
                    // call the mutation
                    const res = await createItem();
                    //redirect to single item page
                    Router.push({
                        pathname: '/item',
                        query: {id: res.data.createItem.id}
                    })
            }}>
            <Error erro={error} />
                <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                        Title
                        <input 
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                        />
                    </label>
                    <label htmlFor="price">
                        Price
                        <input 
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                        />
                    </label>
                    <label htmlFor="description">
                        Description
                        <input 
                        id="description"
                        name="description"
                        placeholder="Enter A Description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                        />
                     </label>
                     <button type="submit">Save Changes</button>
                </fieldset>
            </Form> 
                )}
            </Mutation>
                    )
                }}
            </Query>
            
         
        );
    }
}

export default UpdateItem;
export {UPDATE_ITEM_MUTATION};
