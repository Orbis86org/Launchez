import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import './discussionforum.css';
import { toast } from 'react-toastify';

function DiscussionForum({ tokenId }) {
    /* const [threads, setThreads] = useState([
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
    ]); */

    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: '', content: '' });
    const [replyData, setReplyData] = useState({});
    const [showReplyForm, setShowReplyForm] = useState(null);

    const { accountId, walletInterface } = useWalletInterface();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewThread((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/threads/${tokenId}`, requestOptions);
                const data = await response.json();
                setThreads(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching threads:', error);
            }
        };
        fetchThreads();
    }, [tokenId]);

    useEffect(() => {
        threads && setThreads(threads);
    }, [threads]);


    /* const handleSubmitThread = (e) => {
        e.preventDefault();
        setThreads((prev) => [
            ...prev,
            { id: prev.length + 1, title: newThread.title, author: 'You', date: new Date().toLocaleDateString(), content: newThread.content, replies: [] }
        ]);
        setNewThread({ title: '', content: '' });
    }; */

    const handleSubmitThread = async (e) => {
        e.preventDefault();

        if(!accountId){
            // Add Taost message that connect the wallet to create thread
            toast.error("Connect your wallet to post", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }else{
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/threads`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tokenId, author: accountId ?? 'user', ...newThread }),
                });
                const data = await response.json();
                setThreads((prev) => [...prev, { ...newThread, id: data.id, author: accountId ?? 'user', created_at: new Date().toISOString(), replies: [] }]);
                setNewThread({ title: '', content: '' });
            } catch (error) {
                console.error('Error creating thread:', error);
            }
        }
    };


    const handleShowReplyForm = (id) => {
        setShowReplyForm(id);
        setReplyData({ threadId: id, reply: '' });
    };

    const handleCancelReplyForm = (id) => {
        setShowReplyForm(null);
        setReplyData({});
    };


    const handleReplyChange = (e) => {
        const { value } = e.target;
        setReplyData((prev) => ({ ...prev, reply: value }));
    };

    const handleSubmitReply = async (threadId) => {
        if(!accountId){
            // Add Taost message that connect the wallet to create thread
            toast.error("Connect your wallet to post", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });

        }else{
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ threadId, author: accountId ?? 'user', content: replyData.reply }),
                });
                const data = await response.json();
                setThreads((prev) =>
                    prev?.map((thread) =>
                        thread.id === threadId
                            ? { ...thread, replies: [...thread.replies, { author: accountId ?? 'user', content: replyData.reply }] }
                            : thread
                    )
                );
                setShowReplyForm(null);
                setReplyData({ threadId: null, reply: '' });
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        }
    };

    const convertDate = (threadDate) => {
        // Convert to JavaScript Date object
        const date = new Date(threadDate);
        // Extract components
        // Format the date and time
        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        // Combine date and time
        const output = `${formattedDate}, ${formattedTime}`;

        return output;
    }

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

                    {threads?.length > 0 && <div className="discussion-container">
                        {threads ? threads?.map((thread) => (
                            <Card key={thread.id} className="mb-4">
                                <Card.Body>
                                    <Card.Text className="text-primary responsive-title" color="0d5dfd">{thread.title}</Card.Text>
                                    <Card.Text className="mb-2 text-muted responsive-date-text">
                                        Posted by {thread.author} on {convertDate(thread.created_at)}
                                    </Card.Text>
                                    <Card.Text>{thread.content}</Card.Text>
                                    {showReplyForm === thread.id ?
                                        <Button
                                            variant="primary"
                                            className="mt-2"
                                            onClick={() => handleCancelReplyForm(thread.id)}
                                        >
                                            Cancel
                                        </Button>
                                        :
                                        <Button
                                            variant="primary"
                                            className="mt-2"
                                            onClick={() => handleShowReplyForm(thread.id)}
                                        >
                                            Reply
                                        </Button>
                                    }
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
                                        {thread?.replies && thread?.replies?.map((reply, index) => (
                                            <ListGroup.Item key={index} className="border-0">
                                                <strong>{reply.author}:</strong> {reply.content}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        )) : <h1> No data found!</h1> }
                    </div>
                    }
                </Col>
            </Row>
        </Container>
    );
}

export default DiscussionForum;
