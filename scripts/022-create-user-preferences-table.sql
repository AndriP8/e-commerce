CREATE sequence user_preferences_id_seq;

CREATE TABLE user_preferences (
    id BIGINT PRIMARY KEY DEFAULT nextval('user_preferences_id_seq'),
    user_id BIGINT NOT NULL,
    preferred_currency_id BIGINT NOT NULL DEFAULT 1, -- Default to USD
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_currency_id) REFERENCES currencies(id) ON DELETE SET DEFAULT,
    UNIQUE(user_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_currency ON user_preferences(preferred_currency_id);
