import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import './discussionforum.css';

function DiscussionForum() {
    const [threads, setThreads] = useState([
        {
            id: 1,
            title: 'How to use React Hooks?',
            author: 'Jane Doe',
            date: 'August 20, 2024',
            content: 'React Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.',
            replies: [
                { author: 'John Smith', content: 'You can use `useState` and `useEffect` to manage state and lifecycle.' },
                { author: 'Emily Johnson', content: 'Hooks are great! Don’t forget to use `useContext` for state management.' }
            ]
        },
        {
            id: 2,
            title: 'What are the new features in Bootstrap 5?',
            author: 'John Smith',
            date: 'August 19, 2024',
            content: 'Bootstrap 5 comes with several new features, including new utility classes, a revamped grid system, and better support for custom CSS properties.',
            replies: [
                { author: 'Alice Brown', content: 'The new grid system is fantastic for responsive design.' },
                { author: 'David Lee', content: 'I love the new custom properties for easier theming!' }
            ]
        }
    ]);

    const [newThread, setNewThread] = useState({ title: '', content: '' });
    const [replyData, setReplyData] = useState({});
    const [showReplyForm, setShowReplyForm] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewThread((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitThread = (e) => {
        e.preventDefault();
        setThreads((prev) => [
            ...prev,
            { id: prev.length + 1, title: newThread.title, author: 'You', date: new Date().toLocaleDateString(), content: newThread.content, replies: [] }
        ]);
        setNewThread({ title: '', content: '' });
    };

    const handleShowReplyForm = (id) => {
        setShowReplyForm(id);
        setReplyData({ threadId: id, reply: '' });
    };

    const handleReplyChange = (e) => {
        const { value } = e.target;
        setReplyData((prev) => ({ ...prev, reply: value }));
    };

    const handleSubmitReply = (threadId) => {
        setThreads((prev) =>
            prev.map((thread) =>
                thread.id === threadId
                    ? { ...thread, replies: [...thread.replies, { author: 'You', content: replyData.reply }] }
                    : thread
            )
        );
        setShowReplyForm(null);
        setReplyData({ threadId: null, reply: '' });
    };

    return (
        <Container fluid className="p-4">
            <Row className="justify-content-center">
                <Col md={12}>
                    <h1 className="text-center text-white mb-4">Discussion Forum</h1>
                    <Form onSubmit={handleSubmitThread} className="mb-4">
                        <Form.Group controlId="formThreadTitle">
                            <Form.Label className="text-white">Thread Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={newThread.title}
                                onChange={handleInputChange}
                                placeholder="Enter thread title"
                            />
                        </Form.Group>
                        <Form.Group controlId="formThreadContent">
                            <Form.Label className="text-white">Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="content"
                                value={newThread.content}
                                onChange={handleInputChange}
                                placeholder="Enter thread content"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Start New Thread
                        </Button>
                    </Form>

                    <div className="discussion-container">
                        {threads.map((thread) => (
                            <Card key={thread.id} className="mb-4">
                                <Card.Body>
                                    <Card.Title className="text-primary">{thread.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        Posted by {thread.author} on {thread.date}
                                    </Card.Subtitle>
                                    <Card.Text>{thread.content}</Card.Text>
                                    <Button
                                        variant="outline-light"
                                        className="mt-2"
                                        onClick={() => handleShowReplyForm(thread.id)}
                                    >
                                        {showReplyForm === thread.id ? 'Cancel' : 'Reply'}
                                    </Button>
                                    {showReplyForm === thread.id && (
                                        <Form className="mt-3">
                                            <Form.Group controlId="formReplyContent">
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={replyData.reply}
                                                    onChange={handleReplyChange}
                                                    placeholder="Enter your reply"
                                                />
                                            </Form.Group>
                                            <Button
                                                variant="primary"
                                                onClick={() => handleSubmitReply(thread.id)}
                                            >
                                                Submit Reply
                                            </Button>
                                        </Form>
                                    )}
                                    <ListGroup className="mt-3">
                                        {thread.replies.map((reply, index) => (
                                            <ListGroup.Item key={index} className="border-0">
                                                <strong>{reply.author}:</strong> {reply.content}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default DiscussionForum;
