import React, { useState, useContext, ChangeEvent } from "react";


//Props Drilling start
//pros: easy and straightforward
//cons: hard to maintain when the app becomes larger.

interface UserListProp {
    users: Array<UserProp>,
    removeUser: (id: number) => void
}

interface UserProp {
    id: number,
    name: string,
}

interface UserActionProp extends UserProp {
    removeUser: (id: number) => void
}

const testData = [
    {
        id: 1,
        name: "Jack"
    },
    {
        id: 2,
        name: "Tom"
    },
    {
        id: 3,
        name: "Bob"
    },
    {
        id: 4,
        name: "Alice"
    }
]


export const PropsDrilling = () => {
    const [users, SetUsers] = useState(testData);
    const [isShow, SetIsShow] = useState(false);

    const removeUser = (id: number): void => {
        SetUsers(users.filter((item => item.id != id)));
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        SetIsShow(!isShow);
    }

    return (
        <div>
        
            <h3>Sample of props drilling</h3>
            <input
                name="isShow"
                type="checkbox"
                checked={isShow}
                onChange={handleInputChange} />
            <div style={{ display: isShow ? 'block' : 'none' }}>
                <UserList users={users} removeUser={removeUser}></UserList>
            </div>
          
        </div>
    )
}

const UserList = (props: UserListProp) => {

    return (
        props.users.map((item) => {
            return <User key={item.id} {...item} removeUser={props.removeUser} />
        })
    )
}

const User = (props: UserActionProp) => {
    return (
        <div className="User">
            <div>{props.id}</div>
            <div>{props.name}</div>
            <button onClick={() => {
                props.removeUser(props.id);
            }}>delete</button>
        </div>
    )
}
//Props Drilling end


//useContext Start

const MyContext = React.createContext(undefined);

export const PropsDrillingWithContext = () => {

    const [users, SetUsers] = useState(testData);
    const [isShow, SetIsShow] = useState(false);
    const removeUser = (id: number): void => {
        SetUsers(users.filter((item => item.id != id)));
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        SetIsShow(!isShow);
    }

    return (
        <div>

            <h3>Sample of useContext</h3>
            <input
                name="isShow"
                type="checkbox"
                checked={isShow}
                onChange={handleInputChange} />
            <div style={{ display: isShow ? 'block' : 'none' }}>
                <MyContext.Provider value={{ users, removeUser }}>
                    <UserListWithContext></UserListWithContext>
                </MyContext.Provider>
            </div>

        </div>
    )
}


const UserListWithContext = () => {

    const context = useContext(MyContext);
    return (
        context.users.map((item) => {
            return <UserWithContext key={item.id} {...item} />
        })
    )
}

const UserWithContext = (props: UserProp) => {

    const context = useContext(MyContext);
    return (
        <div className="User">
            <div>{props.id}</div>
            <div>{props.name}</div>
            <button onClick={() => {
                context.removeUser(props.id);
            }}>delete</button>
        </div>
    )
}


//useContext End