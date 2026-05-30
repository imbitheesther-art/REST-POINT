// components/FeedbackForm.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaRegStar, FaHeart, FaSadTear, FaSmile, FaLaugh, FaAngry, FaPray, FaHandHoldingHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Flower } from 'lucide-react';
const BASE_URL = 'https://targeted-granny-dublin-parade.trycloudflare.com/api/v1/restpoint';

// --- Styled Components ---
const PageWrapper = styled.div`
  background: #ffffff;;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  font-family: 'Poppins', sans-serif;
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  padding: 50px;
  background: #ffffff;
  border-radius: 25px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 2.8em;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1em;
  color: #718096;
  margin-top: 10px;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const QuestionSection = styled(motion.div)`
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    background: #edf2f7;
    transform: translateY(-2px);
  }
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-bottom: 15px;
  font-size: 1.1em;
  color: #2d3748;
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;

const StarButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${props => props.selected ? '#ffc107' : '#e2e8f0'};
  font-size: 2.2em;
  transition: all 0.3s ease;

  &:hover {
    color: #ffb300;
    transform: scale(1.2);
  }
`;

const OptionContainer = styled.div`
  display: flex;
  gap: 25px;
  justify-content: center;
  
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1em;
    color: #4a5568;
    transition: all 0.3s ease;
    padding: 10px 20px;
    border-radius: 25px;
    border: 2px solid transparent;
    
    &:hover {
      color: #2d3748;
      background: #edf2f7;
    }

    &.selected {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }
  }

  input[type="radio"] {
    display: none;
  }
`;

const Input = styled.input`
  padding: 15px;
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1em;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1em;
  resize: vertical;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const EmojiContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
`;

const EmojiButton = styled(motion.button)`
  background: ${props => props.selected ? '#3182ce' : 'transparent'};
  color: ${props => props.selected ? 'white' : '#4a5568'};
  border: 2px solid ${props => props.selected ? '#3182ce' : '#e2e8f0'};
  padding: 12px 16px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 18px 30px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1.3em;
  font-weight: 600;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessMessage = styled(motion.div)`
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(72, 187, 120, 0.3);
`;

const SuccessTitle = styled.h3`
  font-size: 2em;
  margin: 0 0 15px 0;
`;

const SuccessText = styled.p`
  font-size: 1.1em;
  margin: 0 0 25px 0;
  opacity: 0.9;
`;

const ViewFeedbackButton = styled(motion.button)`
  background: white;
  color: #48bb78;
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
`;

// Emoji options with labels
const emojiOptions = [
  { emoji: '❤️', label: 'Loved the service', value: 'heart' },
  { emoji: '😊', label: 'Very satisfied', value: 'smile' },
  { emoji: '😢', label: 'Emotional support', value: 'sad' },
  { emoji: '🙏', label: 'Spiritual comfort', value: 'pray' },
  { emoji: '🌹', label: 'Beautiful service', value: 'flower' },
  { emoji: '🤗', label: 'Comforting staff', value: 'hug' },
  { emoji: '⭐', label: 'Excellent service', value: 'star' },
  { emoji: '💫', label: 'Memorable experience', value: 'sparkle' }
];

// Questions data
const questions = [
  { id: 1, text: "How satisfied were you with our funeral service arrangements?", type: "rating", field: "service_rating" },
  { id: 2, text: "How would you rate the compassion and respect shown by our staff?", type: "rating", field: "staff_rating" },
  { id: 3, text: "Was the timing of all services appropriate and well-coordinated?", type: "rating", field: "timeliness_rating" },
  { id: 4, text: "How clean and comfortable were our facilities?", type: "rating", field: "cleanliness_rating" },
  { id: 5, text: "How clear was our communication throughout the process?", type: "rating", field: "communication_rating" },
  { id: 6, text: "Overall, how satisfied are you with our services?", type: "rating", field: "overall_satisfaction" },
  { id: 7, text: "Would you recommend LEE Funeral Services to others?", type: "yes_no", field: "would_recommend" },
  { id: 8, text: "How would you describe your experience with us?", type: "emoji", field: "emoji_reaction" },
  { id: 9, text: "Do you have any suggestions to help us improve our services?", type: "text", field: "suggestions" }
];

const FeuneralFeedbackForm = ({ onViewFeedback }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_rating: 0,
    staff_rating: 0,
    timeliness_rating: 0,
    cleanliness_rating: 0,
    communication_rating: 0,
    overall_satisfaction: 0,
    would_recommend: '',
    suggestions: '',
    emoji_reaction: '',
    deceased_name: '',
    relationship: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${BASE_URL}/feedback`, formData);
      
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Error submitting feedback. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageWrapper>
        <FormContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SuccessMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SuccessTitle>Thank You! 💫</SuccessTitle>
            <SuccessText>
              Your feedback means the world to us. We're committed to providing compassionate 
              service during difficult times, and your insights help us improve.
            </SuccessText>
            <ViewFeedbackButton
              onClick={onViewFeedback}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Feedback
            </ViewFeedbackButton>
          </SuccessMessage>
        </FormContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <FormContainer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Header>
          <Title>Share Your Experience</Title>
          <Subtitle>
            Your feedback helps us provide better support during difficult times
          </Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <QuestionSection
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label>Your Information (Optional)</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <Input
                type="text"
                placeholder="Your Name"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.customer_phone}
                onChange={(e) => handleChange('customer_phone', e.target.value)}
              />
              <Input
                type="text"
                placeholder="Deceased Name"
                value={formData.deceased_name}
                onChange={(e) => handleChange('deceased_name', e.target.value)}
              />
            </div>
            <Input
              type="text"
              placeholder="Your relationship to the deceased"
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              style={{ marginTop: '15px' }}
            />
          </QuestionSection>

          {/* Rating Questions */}
          {questions.map((q, index) => (
            <QuestionSection
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Label>{q.text}</Label>
              
              {q.type === "rating" && (
                <RatingWrapper>
                  {[1, 2, 3, 4, 5].map(n => (
                    <StarButton
                      key={n}
                      type="button"
                      selected={formData[q.field] >= n}
                      onClick={() => handleChange(q.field, n)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {formData[q.field] >= n ? <FaStar /> : <FaRegStar />}
                    </StarButton>
                  ))}
                </RatingWrapper>
              )}
              
              {q.type === "yes_no" && (
                <OptionContainer>
                  <label className={formData[q.field] === 'yes' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name={q.field}
                      value="yes"
                      checked={formData[q.field] === 'yes'}
                      onChange={(e) => handleChange(q.field, e.target.value)}
                    /> 
                    Yes
                  </label>
                  <label className={formData[q.field] === 'no' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name={q.field}
                      value="no"
                      checked={formData[q.field] === 'no'}
                      onChange={(e) => handleChange(q.field, e.target.value)}
                    /> 
                    No
                  </label>
                </OptionContainer>
              )}
              
              {q.type === "emoji" && (
                <EmojiContainer>
                  {emojiOptions.map(emoji => (
                    <EmojiButton
                      key={emoji.value}
                      type="button"
                      selected={formData[q.field] === emoji.value}
                      onClick={() => handleChange(q.field, emoji.value)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span>{emoji.emoji}</span>
                      <span style={{ fontSize: '0.8em' }}>{emoji.label}</span>
                    </EmojiButton>
                  ))}
                </EmojiContainer>
              )}
              
              {q.type === "text" && (
                <TextArea
                  value={formData[q.field] || ""}
                  onChange={(e) => handleChange(q.field, e.target.value)}
                  placeholder="Please share any suggestions or comments that could help us improve..."
                />
              )}
            </QuestionSection>
          ))}

          <SubmitButton 
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: 'inline-block', marginRight: '10px' }}
                >
                  ⏳
                </motion.div>
                Submitting...
              </>
            ) : (
              'Submit Feedback 🌟'
            )}
          </SubmitButton>
        </Form>
      </FormContainer>
    </PageWrapper>
  );
};

export default FeuneralFeedbackForm;