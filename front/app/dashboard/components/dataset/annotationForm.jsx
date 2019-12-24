import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { mainStyle } from 'automan/assets/main-style';
// to popup
import Dialog from '@material-ui/core/Dialog';
import CardHeader from '@material-ui/core/CardHeader';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Close from '@material-ui/icons/Close';
import Send from '@material-ui/icons/Send';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

class AnnotationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      autolabel: false
    };
  }
  handleClickAddAnnotation = () => {
    let name = this.state.name;
    if (name == null || name.length === 0) {
      // TODO: display error info
      console.log('Name is too short');
      return;
    }
    this.setState({ error_string: '' });
    const data = {
      name: name,
      autolabel: this.state.autolabel,
      dataset_id: this.props.dataset_id
    };
    RequestClient.post(
      '/projects/' + this.props.currentProject.id + '/annotations/',
      data,
      info => {
        this.props.hide();
      },
      e => {
        // TODO: display error infomation
        console.log('ERROR', e);
        this.props.hide();
      }
    );
  };
  handleChangeName = e => {
    this.setState({ name: e.target.value });
  };
  handleChangeAutolabel = e => {
    this.setState({ autolabel: e.target.checked });
  };
  closeButton = (
    <Button onClick={this.props.hide}>
      <Close />
    </Button>
  );
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Dialog
          open={this.props.formOpen}
          onClose={this.props.hide}
          maxWidth="sm"
          fullWidth={true}
        >
          <CardHeader action={this.closeButton} title={'Create Annotation'} />
          <DialogContent>
            <FormControl>
              <TextField
                label="New Annotation Name"
                value={this.state.name}
                onChange={this.handleChangeName}
              />
            </FormControl>
            <br />
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.autolabel}
                    onChange={this.handleChangeAutolabel}
                    color="primary"
                  />
                }
                label="Run Autolabeling"
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={this.state.name === ""}
              onClick={this.handleClickAddAnnotation}
              className={classes.button}
            >
              <Send /> Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentProject: state.projectReducer.currentProject
  };
};
export default compose(
  withStyles(mainStyle, { name: 'AnnotationForm' }),
  connect(
    mapStateToProps,
    null
  )
)(AnnotationForm);