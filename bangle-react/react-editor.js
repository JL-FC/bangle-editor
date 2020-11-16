import React from 'react';
import reactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { objUid } from 'bangle-core/utils/object-uid';
import { BangleEditor } from 'bangle-core/editor';
import { saveRenderHandlers } from 'bangle-core/node-view';
import { bangleWarn } from 'bangle-core/utils/js-utils';

const LOG = false;

let log = LOG ? console.log.bind(console, 'react-editor') : () => {};

const nodeViewUpdateCallbackCache = new WeakMap();

export class ReactEditor extends React.PureComponent {
  static propTypes = {
    options: PropTypes.object.isRequired,
    renderNodeViews: PropTypes.func,
    onReady: PropTypes.func,
  };

  editorRenderTarget = React.createRef();
  state = { nodeViews: [] };

  renderHandlers = {
    create: (nodeView, nodeViewProps) => {
      log('create', objUid.get(nodeView));
      this.setState(({ nodeViews }) => ({
        nodeViews: [...nodeViews, nodeView],
      }));
    },
    update: (nodeView, nodeViewProps) => {
      log('update', objUid.get(nodeView));
      const updateCallback = nodeViewUpdateCallbackCache.get(nodeView);
      // If updateCallback is undefined (which can happen if react took long to mount),
      // we are still okay, as the latest nodeViewProps will be accessed whenever it mounts.
      if (updateCallback) {
        updateCallback();
      }
    },
    destroy: (nodeView) => {
      log('destroy', objUid.get(nodeView));
      this.setState(({ nodeViews }) => ({
        nodeViews: nodeViews.filter((n) => n !== nodeView),
      }));
    },
  };

  async componentDidMount() {
    const { options } = this.props;
    // save the renderHandlers in the dom to decouple nodeView instantiating code
    // from the editor. Since PM passing view when nodeView is created, the author
    // of the component can get the handler reference from `getRenderHandlers(view)`.
    // Note: this assumes that the pm's dom is the direct child of `editorRenderTarget`.
    saveRenderHandlers(this.editorRenderTarget.current, this.renderHandlers);
    this.editor = new BangleEditor(this.editorRenderTarget.current, options);
    if (this.props.onReady) {
      this.props.onReady(this.editor);
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  render() {
    log(
      'rendering PMEditorWrapper',
      this.state.nodeViews.map((n) => objUid.get(n)),
    );
    return (
      <>
        <div ref={this.editorRenderTarget} id={this.props.options.id} />
        {this.state.nodeViews.map((nodeView) => {
          return reactDOM.createPortal(
            <NodeViewElement
              nodeView={nodeView}
              renderNodeViews={this.props.renderNodeViews}
            />,
            nodeView.mountDOM,
            objUid.get(nodeView),
          );
        })}
      </>
    );
  }
}

class NodeViewElement extends React.PureComponent {
  static propTypes = {
    nodeView: PropTypes.object.isRequired,
    renderNodeViews: PropTypes.func.isRequired,
  };

  update = () => {
    this.setState((state, props) => ({
      nodeViewProps: props.nodeView.getNodeViewProps(),
    }));
  };

  constructor(props) {
    super(props);
    // So that we can directly update the nodeView without the mess
    // of prop forwarding. This is okay because a nodeView and ReactComponent has
    // 1:1 mapping always.
    nodeViewUpdateCallbackCache.set(props.nodeView, this.update);
    this.state = { nodeViewProps: this.props.nodeView.getNodeViewProps() };
  }

  attachToContentDOM = (reactElement) => {
    if (!reactElement) {
      return;
    }
    const { contentDOM } = this.props.nodeView;
    // Since we do not control how many times this callback is called
    // make sure it is not already mounted.
    if (!reactElement.contains(contentDOM)) {
      // If contentDOM happens to be mounted to someone else
      // remove it from there.
      if (contentDOM.parentNode) {
        contentDOM.parentNode.removeChild(contentDOM);
      }
      reactElement.appendChild(contentDOM);
    }
  };

  getChildren() {
    if (!this.props.nodeView.contentDOM) {
      return null;
    }

    if (this.state.nodeViewProps.node.isInline) {
      return (
        <span className="bangle-content-mount" ref={this.attachToContentDOM} />
      );
    }

    return (
      <div className="bangle-content-mount" ref={this.attachToContentDOM} />
    );
  }

  render() {
    log('react rendering', objUid.get(this.props.nodeView));
    const element = this.props.renderNodeViews({
      ...this.state.nodeViewProps,
      children: this.getChildren(),
    });
    if (!element) {
      bangleWarn(
        'renderNodeView prop must return a react element for the node',
        this.state.nodeViewProps.node,
      );
      throw new Error(
        `renderNodeView must handle rendering for node of type "${this.state.nodeViewProps.node.type.name}"`,
      );
    }
    return element;
  }
}