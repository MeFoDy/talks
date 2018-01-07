@autobind
class AddNewItemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: []
        };
    }

    addItem(event) {
        event.preventDefault();
        const item = this.refs.item.value.trim();
        if (item !== '') {
            this.setState((prevState) => ({
                items: [...prevState.items, item]
            }));
        }
    }

    render() {
        return (
            <div>
                <h3>Add new item</h3>
                {/* <form className='new-item' onSubmit={this.addItem.bind(this)}> */}
                <form className='new-item' onSubmit={this.addItem}>
                    <input type='text' ref='item' />
                    <button type='submit'>Add</button>
                </form>
            </div>
        );
    }
}
