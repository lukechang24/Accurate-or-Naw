import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from "react-router-dom"
import { withFirebase } from "../Firebase"
import SignUpForm from "../SignUpForm"
import SignInForm from "../SignInForm"
import Lobby from "../Lobby"
import Room from "../Room"
import Profile from "../Profile"
import S from "./style"
import { auth } from 'firebase';

class App extends Component {
  unsubscribe = null
  state = {
    currentUser: JSON.parse(localStorage.getItem("savedUser")) || {},
    error: null
  }
  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(authUser => {
      if(authUser) {
        this.props.firebase.findUser1(authUser.uid).once("value", doc => {
          const userJson = JSON.stringify({...doc.val()})
          localStorage.setItem("savedUser", userJson)
          this.setState({
            currentUser: {
              ...doc.val()
            }
          }, () => {
            this.checkForUserChanges()
            console.log(this.state.currentUser)
          })
        })
        this.setUserStatusOnline()
      } else {
        this.setState({
          currentUser: {}
        })
      }
    })
  }
  componentDidCatch(error, errorInfo) {
    this.props.history.push("/lobby")
  }
  checkForUserChanges = () => {
    if(this.state.currentUser.id) {
      this.unsubscribe = this.props.firebase.findUser1(this.state.currentUser.id).on("value", user => {
        this.setState({
          currentUser: {...user.val()}
        })
      })
    }
  }
  setUserStatusOnline = () => {
    const onlineStatus = {
      isOnline: true,
    }
    const offlineStatus = {
      isOnline: false,
    }
    this.props.firebase.connectionRef()
      .on("value", snapshot => {
        if(snapshot.val() === false) {
            // this.props.firebase.userStatusFirestoreRef().set(offlineStatus)
            return
        }
        this.props.firebase.userStatusDatabaseRef().onDisconnect().set(offlineStatus)
          .then(() => {
            this.props.firebase.userStatusDatabaseRef().set(onlineStatus)
        })
      })
  }
  setCurrentUser = currentUser => {
    this.setState({
      currentUser
    })
  }
  setError = (newError) => {
    this.setState({
      error: newError
    })
  }
  resetError = () => {
    this.setState({
      error: null
    })
  }
  signOut = () => {
    this.props.firebase.findUser1(this.state.currentUser.id).off("value", this.unsubscribe)
    this.setState({
      currentUser: {}
    })
    if(this.props.firebase.auth.currentUser) {
      if(this.state.currentUser.isAnonymous) {
        this.props.firebase.findUser1(this.state.currentUser.id).update({doRemove: true})
      }
      localStorage.removeItem("savedUser")
      this.props.firebase.signOut()
      this.props.firebase.userStatusDatabaseRef().set({isOnline: false})
      this.props.history.push("/auth/signin")
    }
  }
  componentWillUnmount() {
    // this.unsubscribe()
  }
  render() {
    return (
      <S.AppContainer>
        {this.state.error 
          ?
            <S.Container1>
              <S.ErrorContainer>
                <S.CancelError onClick={this.resetError} className="fas fa-times"></S.CancelError>
                <S.Error>{this.state.error}</S.Error>
              </S.ErrorContainer>
            </S.Container1>
          :
            null
        }
        <Switch>
          <Route exact path="/auth/signup" render={() => <SignUpForm currentUser={this.state.currentUser}/>}></Route>
          <Route exact path="/auth/signin" render={() => <SignInForm currentUser={this.state.currentUser}/>}></Route>
          <Route exact path="/lobby" render={() => <Lobby currentUser={this.state.currentUser} setError={this.setError} signOut={this.signOut} />}></Route>
          <Route exact path="/lobby/:id" render={() => <Room currentUser={this.state.currentUser} setCurrentUser={this.setCurrentUser} setError={this.setError}/>}></Route>
          <Route exact path="/user/:id" render={() => <Profile currentUser={this.state.currentUser}/>}></Route>
          <Route>
            <Redirect to="/lobby"></Redirect>
          </Route>
        </Switch>
      </S.AppContainer>
    )
  }
}

export default withRouter(withFirebase(App))
