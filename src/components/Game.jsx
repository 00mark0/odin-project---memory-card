import { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";

function Game() {
  const [level, setLevel] = useState(2); // start from level 2 (4 items)
  const [clickedItems, setClickedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [gameMessage, setGameMessage] = useState("");

  useEffect(() => {
    const promises = Array.from({ length: level * 2 }, () => {
      const randomId = Math.floor(Math.random() * 898) + 1;
      return axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    });

    Promise.all(promises)
      .then((responses) => {
        const pokemonData = responses.map((response) => response.data);
        setItems(shuffle(pokemonData));
        setClickedItems([]); // reset clicked items at the start of each level
        setCorrectClicks(0); // reset correct clicks at the start of each level
        setGameMessage(""); // reset game message at the start of each level
      })
      .catch((error) => console.error(error));
  }, [level]);

  const handleClick = (item) => {
    if (clickedItems.includes(item)) {
      setLevel(2); // reset to level 2 (4 items)
      setClickedItems([]);
      setCorrectClicks(0); // reset correct clicks when the game resets
      setGameMessage("You clicked the same Pokemon!"); // set game message when user clicks the same item

      // set a timer to clear the game message after 3 seconds
      setTimeout(() => {
        setGameMessage("");
      }, 2000);
    } else {
      const newClickedItems = [...clickedItems, item];
      setClickedItems(newClickedItems);
      setCorrectClicks((prevCorrectClicks) => prevCorrectClicks + 1); // increment correct clicks
      if (newClickedItems.length === level * 2) {
        // check if all items have been clicked
        setLevel((prevLevel) => prevLevel + 1);
      }
    }
    setItems((prevItems) => shuffle([...prevItems])); // shuffle items after each click
  };

  // Fisher-Yates (aka Knuth) shuffle algorithm
  function shuffle(array) {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // while there remain elements to shuffle...
    while (0 !== currentIndex) {
      // pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // and swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function getGridClass(level) {
    switch (
      level // grid columns based on level, for larger screens
    ) {
      case 2:
        return "lg:grid-cols-2";
      case 3:
        return "lg:grid-cols-3";
      case 4:
        return "lg:grid-cols-4";
      case 5:
        return "lg:grid-cols-5";
      case 6:
        return "lg:grid-cols-6";
      default:
        return "lg:grid-cols-1";
    }
  }

  function resetGame() {
    // function for the reset button
    setLevel(2);
    setClickedItems([]);
    setCorrectClicks(0);
    setGameMessage("");
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-center">Level: {level - 1}</h2>{" "}
      <h2 className="text-center">Score: {correctClicks}</h2>{" "}
      <h2>{gameMessage}</h2>
      {level > 6 ? ( // check if level is greater than 6 (12 items)
        <div className="text-center">
          <Confetti />
          <h1>Congratulations! You beat the game!</h1>
        </div>
      ) : (
        <div
          className={`w-4/6 grid grid-cols-2 ${getGridClass(
            level
          )} grid-rows-2 gap-10 lg:gap-4 mt-16 lg:mt-32`}
        >
          {items.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center text-center"
            >
              <div
                onClick={() => handleClick(item)}
                className="cursor-pointer flex flex-col items-center text-center bg-slate-800 hover:bg-slate-300 rounded-lg p-4 text-blue-500 transition duration-300 ease-in-out font-semibold"
              >
                <img
                  src={item.sprites.front_default}
                  alt={item.name}
                  className="w-24 h-24"
                />
                <p>{item.name.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={resetGame}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-10 mb-10 transition duration-300 ease-in-out"
      >
        Reset Game
      </button>
    </div>
  );
}

export default Game;
