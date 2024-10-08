import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Image, Text } from "react-native";
import PropTypes from 'prop-types';
import { ChoiceButton } from './ChoiceButton';
import TypingIndicator from './TypingIndicator';
import { chatBoxStyles } from './ChatBoxStyles';
import { imageStyles } from './ImageStyles';
import { Card } from './Card';
import { MyCarousel } from './Carousel';

const prepMessageSent = (message) => {
  return (
    <View>
      {message ? <View>
                <Text style={chatBoxStyles.message.sent.text}>{message}</Text>
            </View>: null
        }
    </View>
  );
};

const prepMessageRecieved = (trace, userSendAction) => {
  if (trace.type === 'text') {
    return (
      <View>
        {trace.payload.message ? <View style={chatBoxStyles.message.received} >
                <Text style={chatBoxStyles.message.received.text}>{trace.payload.message}</Text>
            </View>: null
        }
      </View>
    );
  } else if (trace.type === 'visual') {
    if (trace.payload.visualType === 'image') {
      return (
        <View>
            <Image style={imageStyles.image}
                source={{
                    uri: `${trace.payload.image}`,
                    }
                } alt="Image trace"
            />
        </View>
      );
    } else {
      return (
        <View style={chatBoxStyles.message.received}>
          <Text>{JSON.stringify(trace)}</Text>
        </View>
      );
    }
  } else if (trace.type === 'cardV2') {
    return (
        <Card payload={trace.payload} userSendAction={userSendAction}/>
    )
} else if (trace.type === 'carousel') {
    return (
        <MyCarousel cards={trace.payload.cards}/>
    )
} else if (trace.type === 'color_text') {
    return (
      <View style={{color: trace.payload.color}}>
        <Text>{trace.payload.text}</Text>
      </View>
    );
  }  else if (
    trace.type === 'choice' ||
    trace.type === 'path' ||
    trace.type === 'suggest_question_buttons' || 
    trace.type === 'end'
  ) {
    return (null); //Handled further down
  } else {
    return (
      <View style={chatBoxStyles.message.received}>
        <Text>{JSON.stringify(trace)}</Text>
      </View>
    );
  }
};

const ChatBox = ({messages, choices, isAwaitingResponse, userSendAction}) => {
    const scrollViewRef = useRef(null); // Create a ref for ScrollView

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      // Small delay to ensure that new message is rendered before scrolling
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]); // Effect runs whenever messages are updated

  return (
    <ScrollView ref={scrollViewRef} style={chatBoxStyles.chatbox}>
      {messages.map((message, index) => (
        message.sender === 'user' ? (
          <View style={chatBoxStyles.message.sent} key={index}>
            {prepMessageSent(message.content)}
          </View>
        ) : (
          prepMessageRecieved(message.content) === null ? null :
            <View key={index}>
              {prepMessageRecieved(message.content, userSendAction)}
            </View>
        )
      ))}
      {isAwaitingResponse ?
      <View style={chatBoxStyles.message.received}>
        <TypingIndicator />
      </View> : null}
      <ChoiceButton choices={choices} />
    </ScrollView>
  );
};

ChatBox.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  choices: PropTypes.object,
  isAwaitingResponse: PropTypes.bool,
  userSendAction: PropTypes.func,
};

export default ChatBox;