"""Criação inicial da tabela users com nome

Revision ID: b5eb46019409
Revises: 
Create Date: 2025-07-29 16:53:02.717041

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b5eb46019409'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('nome', sa.String(length=120), nullable=False),
    sa.Column('password_hash', sa.String(length=512), nullable=False),
    sa.Column('smtp_password', sa.String(length=1024), nullable=False),
    sa.Column('reset_token', sa.String(length=100), nullable=True),
    sa.Column('reset_token_expiration', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    # ### end Alembic commands ###
