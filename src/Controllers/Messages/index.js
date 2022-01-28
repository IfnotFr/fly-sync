module.exports = {
  get (props) {
    return new (require('./' + props.name))(props)
  }
}