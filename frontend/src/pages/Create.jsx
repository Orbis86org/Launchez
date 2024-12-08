import React, {useRef, useState} from 'react';
import PageTitle from '../components/pagetitle';
import {
    AccountId,
    Client, CustomFee,
    Hbar,
    PrivateKey,
    TokenCreateTransaction,
    TokenSupplyType,
    Transaction,
    TransactionId,
    TransactionReceiptQuery, TransferTransaction
} from "@hashgraph/sdk";

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BondingCurve from "../classes/BondingCurve";
import TokenService from "../services/tokens/tokenService";
import {useWalletInterface} from "../services/wallets/useWalletInterface";
import ToastsService from "../services/toasts/toastsService";
import TokenDetails from "./TokenDetails";

Create.propTypes = {

};

function Create(props) {

    const [form, setForm] = useState( null );
    const [name, setName ] = useState('');
    const [ticker, setTicker ] = useState('');
    const [description, setDescription] = useState('');

    const { accountId, walletInterface } = useWalletInterface();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null); // State for image preview
    const [dragOver, setDragOver] = useState(false); // State to handle drag-and-drop styling

    const fileInputRef = useRef(null); // Reference to the hidden file input

    // Handle drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            alert('Please upload a valid image file (JPEG, PNG, GIF).');
        }
    };

    const handleImageChange = (e) => {
        //setImage(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Set the selected image file
            setPreview(URL.createObjectURL(file)); // Generate and set the preview URL
        }
    };

    // Handle file input click
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            alert('Please upload a valid image file (JPEG, PNG, GIF).');
        }
    };

    // Trigger file input click on dropzone click
    const handleDropzoneClick = () => {
        fileInputRef?.current?.click();
    };



    return (
        <div>
            <PageTitle heading='Create Token' title='Create Token' />

            <section className="contact">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="contact-main">
                                <div className="block-text center">
                                    <h3 className="heading">Create a Token Below</h3>
                                    <p className="desc fs-20">Fill the Form Below to Create a Token</p>
                                </div>

                                <form
                                    id='token-creation'
                                    ref={form => setForm(form)}
                                    encType='multipart/form-data'
                                >
                                    {/* Name */}
                                    <div className="form-group">
                                        <label>Token Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Token Name"
                                            onChange={function (e) {
                                                setName(e.target.value);
                                            }}
                                            required={ true }
                                        />
                                    </div>

                                    {/* Ticker */}
                                    <div className="form-group">
                                        <label>Token Ticker</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Token Ticker"
                                            onChange={function (e) {
                                                setTicker(e.target.value);
                                            }}
                                            required={ true }
                                        />
                                    </div>

                                    {/* Image */}
                                    <div
                                        className={`dropzone mb-3 p-4 text-center ${dragOver ? 'border-primary' : 'border-secondary'}`}
                                        style={{
                                            border: '2px dashed',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={handleDropzoneClick} // Trigger file input on click
                                    >
                                        <p className="mb-0">
                                            {image
                                                ? 'File selected: ' + image.name
                                                : 'Drag and drop an image here or click to select'}
                                        </p>
                                        {preview && (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="mt-3"
                                                style={{maxWidth: '100%', maxHeight: '200px'}}
                                            />
                                        )}
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg, image/png, image/gif"
                                        onChange={handleFileInputChange}
                                    />

                                    {/* Description */}
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            cols="30"
                                            rows="10"
                                            className="form-control"
                                            placeholder="Token Description"
                                            onChange={function (e) {
                                                setDescription(e.target.value);
                                            }}
                                            required={ true }
                                        ></textarea>
                                    </div>


                                    <button
                                        type="submit"
                                        className="btn-action"
                                        onClick={async function (e) {
                                            e.preventDefault();

                                            // Get the form element
                                            const form = e.target.closest("form");

                                            // Check form validity
                                            if (!form.checkValidity()) {
                                                form.reportValidity(); // Highlights invalid fields
                                                return;
                                            }

                                            const imageFile = document.querySelector('input[type="file"]').files[0]; // Get the image file

                                            // Step 1: Launch the Token
                                            const tokenCreated = await new TokenService(
                                                AccountId.fromString(accountId),
                                                walletInterface
                                            ).deployToken(
                                                name,
                                                ticker,
                                                name + " Token Launch",
                                                description,
                                                imageFile
                                            )

                                            if (!tokenCreated) {
                                                await new ToastsService().showErrorToast("An error has occurred. Please try again.");

                                                return;
                                            }

                                            // Token Created Successfully
                                            await new ToastsService().showSuccessToast("Token Created Successfully");

                                            window.location.replace(`/token?token-id=${tokenCreated?.tokenId}`);


                                        }}
                                        disabled={!accountId}
                                    >
                                        {accountId ? 'Create Token' : 'Connect Wallet to Proceed'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Create;