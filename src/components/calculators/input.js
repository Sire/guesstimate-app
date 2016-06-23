import React, {Component} from 'react'

import Icon from 'react-fa'

import {EditorState, Editor, ContentState} from 'draft-js'

export class Input extends Component{
  state = {editorState: EditorState.createWithContent(ContentState.createFromText(''))}

  componentDidMount() {
    if (this.props.isFirst) {
      setTimeout(() => {this.refs.editor.focus()}, 1)
    }
  }

  onChange(editorState) {
    this.props.onChange(editorState.getCurrentContent().getPlainText(''))
    return this.setState({editorState})
  }

  hasValidContent() {
    const content = this.state.editorState.getCurrentContent().getPlainText('')
    return !_.isEmpty(content) && _.isEmpty(this.props.errors)
  }

  render () {
    const {name, errors} = this.props
    return (
      <div className='input'>
        <div className='row'>
          <div className='col-xs-12 col-sm-7'><div className='name'>{name}</div></div>
          <div className='col-xs-12 col-sm-5'>
            <div className='editor'>
              <Editor
                ref='editor'
                editorState={this.state.editorState}
                onChange={this.onChange.bind(this)}
                handleReturn={() => true}
              />
              {!_.isEmpty(errors) && <div className='status error'><Icon name='close' /></div>}
              {this.hasValidContent() && <div className='status success'><Icon name='check' /></div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}